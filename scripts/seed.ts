// we use require instead of import because this is in pure node.js so has no relation to our react or any
// environment which next 13 uses
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
	try {
		await db.catgory.createMany({
			data: [
				{ name: "Famous People" },
				{ name: "Movies & TV" },
				{ name: "Musicians" },
				{ name: "Games" },
				{ name: "Animals" },
				{ name: "Philosophy" },
				{ name: "Scientists" },
			],
		});
	} catch (error) {
		console.error("Error seeding default categories:", error);
	} finally {
		await db.$disconnect();
	}
}

main();
