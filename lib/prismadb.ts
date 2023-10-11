import { PrismaClient } from "@prisma/client";

declare global {
	// prisma almacena la instancia de PrismaClient para que no se cree cada vez que se importa el módulo
	var prisma: PrismaClient | undefined;
}

//prisma db can be used as a singleton which means that only one instance of the PrismaClient class is created and used throught the entire application
const prismadb = globalThis.prisma || new PrismaClient();
// globalThis es una variable global que se puede acceder desde cualquier lugar para acceder a la instancia global de PrismaClient
if (process.env.NODE_ENV !== "production") globalThis.prisma = prismadb;

export default prismadb;
