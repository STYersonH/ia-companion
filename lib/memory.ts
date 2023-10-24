import { Redis } from "@upstash/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

// se define que el tipo CompanionKey es un objeto con las propiedades companionName, modelName y userId
export type CompanionKey = {
	companionName: string;
	modelName: string;
	userId: string;
};

// se define la clase MemoryManager
export class MemoryManager {
	private static instance: MemoryManager;
	// las propiedades definidas son history y vectorDBClient
	private history: Redis; // history sera de tipo Redis
	private vectorDBClient: Pinecone; // vectorDBClient sera de tipo Pinecone

	// se inicializa los valores de history y vectorDBClient
	public constructor() {
		this.history = Redis.fromEnv(); //automatically loads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from .env
		this.vectorDBClient = new Pinecone({
			apiKey: process.env.PINECONE_API_KEY!,
			environment: process.env.PINECONE_ENVIRONMENT!,
		}); // se inicializa vectorDBClient con los valores de las variables de entorno PINECONE_API_KEY y PINECONE_ENVIRONMENT
	}

	/*
  public async init() {
    if (this.vectorDBClient instanceof Pinecone) {
      await this.vectorDBClient = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENVIRONMENT!,
      });
    }
  }*/

	// metodo asincrono que busca la similitud de documentos en la base de datos vectorial
	public async vectorSearch(
		recentChatHistory: string, // recibe un string con el historial de chat
		companionFileName: string // recibe un string con el nombre del companion
	) {
		// se asigna a pinecone el valor de vectorDBClient que es de tipo Pinecone
		const pinecone = <Pinecone>this.vectorDBClient;

		// se asigna a pineconeIndex el valor de la variable de entorno PINECONE_INDEX
		const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX! || "");

		// usando un objeto OpenAIEmbeddings y un indice existente se crea una instancia de PineconeStore
		// usa await para esperar a que se cree la instancia
		const vectorStore = await PineconeStore.fromExistingIndex(
			//El objeto OpenAIEmbeddings se crea con una clave de API de OpenAI
			new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY! }),
			{ pineconeIndex }
		);

		// se usa la instancia creada para buscar la similitud de documentos vectoriales
		const similarDocs = await vectorStore
			// recentChatHistory es un arreglo de vectores que representan el historial de chat reciente, 3 es el numero maximo de resultados que se desean obtener y se usa el companionFileName como filtro de resultados por nombre de companion
			.similaritySearch(recentChatHistory, 3, { fileName: companionFileName })
			.catch((err) => {
				console.log("Failed to get vector search results", err);
			}); //si falla se captura el error

		return similarDocs; // se retorna el resultado de la busqueda, es decir de la similitud de documentos vectoriales
	}

	// metodo asincrono que retorna una promesa de un instancia MemoryManager
	public static async getInstance(): Promise<MemoryManager> {
		// si no existe una instancia de MemoryManager se crea una nueva
		if (!MemoryManager.instance) {
			MemoryManager.instance = new MemoryManager();
			//await MemoryManager.instance.init();
		}

		return MemoryManager.instance;
	}

	// metodo privado que gebera una Redis key basado en el companionKey object
	private generateRedisCompanionKey(companionKey: CompanionKey): string {
		return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
	}

	//metodo asincrono que escribe un mensaje de chat en el historial Redis
	// text representa el mensaje de chat
	// companionKey es un objeto con las propiedades companionName, modelName y userId, representa la clave del companion
	public async writeToHistory(text: string, companionKey: CompanionKey) {
		// si companionKey no existe o companionKey.userId no esta definido se retorna un string vacio
		if (!companionKey || typeof companionKey.userId == "undefined") {
			console.log("Companion key set incorrectly");
			return "";
		}

		// se genera una Redis key basado en el companionKey object
		const key = this.generateRedisCompanionKey(companionKey);

		// se escribe en la BD Redis usando el metodod zadd
		// result sera el resultado de la operacion de escritura
		const result = await this.history.zadd(
			key, // la llave o clave de la BD a la que se desea escribir
			//el sig parametro tiene 2 props
			{
				score: Date.now(), // numero que representa la puntuacion que se desea asignar al miembro que esta escribiendo, en este caso es la marca de tiempo actual
				member: text, // es un string que representa el mensaje de chat que se desea escribir
			}
		);

		return result; // se retorna el resultado de la operacion de escritura
	}

	// metodo asincrono que lee el ultimo chat del historial de la BD Redis
	public async readLatestHistory(companionKey: CompanionKey): Promise<string> {
		// si companionKey no existe o companionKey.userId no esta definido se retorna un string vacio
		if (!companionKey || typeof companionKey.userId == "undefined") {
			console.log("Companion key set incorrectly");
			return "";
		}

		// se genera una Redis key basado en el companionKey object
		const key = this.generateRedisCompanionKey(companionKey);
		// se llama al metodo zrange de la BD redis usando la instancia history
		let result = await this.history.zrange(
			// la llave de la BD Redis en la que desea buscarse
			key,
			// valor minimo de puntuacion que se desea buscar
			0,
			// valor maximo de puntuacion que se desea buscar
			Date.now(),
			// byScore en true significa que se desea ordenar los resultados por puntuacion
			{
				byScore: true,
			}
		);

		// se toma los ultimos 30 resultados y se invierte el orden
		result = result.slice(-30).reverse();
		// se revierte nuevamente los elementos de result y se une los elementos separando por un salto de linea
		const recentChats = result.reverse().join("\n");
		return recentChats;
	}

	// metodo asincrono que usa la semilla de contenido para escribir en el historial de chat
	public async seedChatHistory(
		seedContent: String,
		delimiter: string = "\n",
		companionKey: CompanionKey
	) {
		const key = this.generateRedisCompanionKey(companionKey);

		if (await this.history.exists(key)) {
			console.log("User already has chat history");
			return;
		}

		const content = seedContent.split(delimiter);
		let counter = 0;

		for (const line of content) {
			await this.history.zadd(key, { score: counter, member: line });
			counter += 1;
		}
	}
}
