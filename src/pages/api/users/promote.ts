import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function PromoteAPI(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  try {
    const user = await prisma.users.update({
      where: {
        id: req.body.userId
      },
      data: {
        role: "Dono"
      }
    });

    return res.status(200).json({ message: "Usuário promovido com sucesso", user });
  } catch (error) {
    console.error("Erro ao promover usuário:", error);
    return res.status(500).json({ message: "Erro ao promover usuário" });
  }
}
