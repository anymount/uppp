import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function AdminSetupAPI(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Buscar todos os usuários para encontrar o seu
    const users = await prisma.users.findMany();
    console.log("Usuários encontrados:", users);

    if (users.length > 0) {
      // Promover o primeiro usuário para Dono
      const user = await prisma.users.update({
        where: {
          id: users[0].id
        },
        data: {
          role: "Dono"
        }
      });

      return res.status(200).json({ 
        message: "Admin configurado com sucesso", 
        user 
      });
    } else {
      return res.status(404).json({ 
        message: "Nenhum usuário encontrado" 
      });
    }
  } catch (error) {
    console.error("Erro:", error);
    return res.status(500).json({ 
      message: "Erro ao configurar admin",
      error: error
    });
  }
}
