import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Question from "@/lib/models/Question";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { voteType } = await request.json();

    if (!voteType || (voteType !== "like" && voteType !== "dislike")) {
      return NextResponse.json(
        { error: "Invalid vote type. Must be 'like' or 'dislike'" },
        { status: 400 }
      );
    }

    await connectDB();
    const { id } = await params;
    console.log("question", id);
    const question = await Question.findById(id);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Obtener el arreglo de votos de usuarios
    let userVotesArray = question.userVotes || [];

    // Buscar si el usuario ya votó
    const existingVoteIndex = userVotesArray.findIndex(
      (vote: any) => vote.userId === userId
    );
    const existingVote =
      existingVoteIndex !== -1 ? userVotesArray[existingVoteIndex] : null;

    // Si el usuario ya votó del mismo tipo, remover el voto
    if (existingVote && existingVote.voteType === voteType) {
      // Remover el voto
      if (voteType === "like") {
        question.likes = Math.max(0, (question.likes || 0) - 1);
      } else {
        question.dislikes = Math.max(0, (question.dislikes || 0) - 1);
      }
      // Remover el voto del arreglo
      userVotesArray = userVotesArray.filter(
        (vote: any) => vote.userId !== userId
      );
    } else if (existingVote) {
      // Cambiar de like a dislike o viceversa
      if (existingVote.voteType === "like") {
        question.likes = Math.max(0, (question.likes || 0) - 1);
        question.dislikes = (question.dislikes || 0) + 1;
      } else {
        question.dislikes = Math.max(0, (question.dislikes || 0) - 1);
        question.likes = (question.likes || 0) + 1;
      }
      // Actualizar el voto existente en el arreglo
      userVotesArray[existingVoteIndex] = { userId, voteType };
    } else {
      // Primera vez votando - Agregar nuevo voto al arreglo
      if (voteType === "like") {
        question.likes = (question.likes || 0) + 1;
      } else {
        question.dislikes = (question.dislikes || 0) + 1;
      }
      // Agregar nuevo voto al arreglo
      userVotesArray.push({ userId, voteType });
    }

    // Asignar el arreglo actualizado y marcar como modificado
    question.userVotes = userVotesArray;
    question.markModified("userVotes");

    // Actualizar votes como la diferencia
    question.votes = (question.likes || 0) - (question.dislikes || 0);

    await question.save();

    // Buscar el voto del usuario en el arreglo
    const userVoteEntry = (question.userVotes || []).find(
      (vote: any) => vote.userId === userId
    );
    const userVote = userVoteEntry ? userVoteEntry.voteType : null;

    return NextResponse.json({
      id: question._id.toString(),
      likes: question.likes || 0,
      dislikes: question.dislikes || 0,
      votes: question.votes || 0,
      userVote: userVote,
    });
  } catch (error) {
    console.error("Error voting on question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
