import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Question from "@/lib/models/Question";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, orientation, username } = body;

    if (!title || !description || !orientation || !username) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const question = new Question({
      title,
      description,
      orientation,
      username,
      userId,
      votes: 0,
      likes: 0,
      dislikes: 0,
      userVotes: [],
    });

    await question.save();

    return NextResponse.json(
      {
        id: question._id.toString(),
        title: question.title,
        description: question.description,
        votes: question.votes,
        likes: question.likes || 0,
        dislikes: question.dislikes || 0,
        createdAt: question.createdAt,
        orientation: question.orientation,
        username: question.username,
        userId: question.userId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { userId } = await auth();

    const questions = await Question.find().sort({ createdAt: -1 }).exec();

    return NextResponse.json(
      questions.map((q) => {
        // Buscar el voto del usuario actual en el arreglo userVotes
        const userVoteEntry = q.userVotes?.find(
          (vote: any) => vote.userId === userId
        );
        const userVote = userVoteEntry ? userVoteEntry.voteType : null;

        return {
          id: q._id.toString(),
          title: q.title,
          description: q.description,
          votes: q.votes || 0,
          likes: q.likes || 0,
          dislikes: q.dislikes || 0,
          createdAt: q.createdAt,
          orientation: q.orientation,
          username: q.username,
          userId: q.userId,
          userVote: userVote, // Incluir el voto del usuario actual
        };
      })
    );
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
