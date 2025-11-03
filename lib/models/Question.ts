import mongoose, { Schema, Document } from "mongoose";

export interface IUserVote {
  userId: string;
  voteType: "like" | "dislike";
}

export interface IQuestion extends Document {
  title: string;
  description: string;
  votes: number;
  likes: number;
  dislikes: number;
  createdAt: Date;
  orientation: "backend" | "frontend";
  username: string;
  userId: string; // Clerk user ID
  userVotes: IUserVote[]; // Array of user votes
}

const QuestionSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    orientation: {
      type: String,
      enum: ["backend", "frontend"],
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userVotes: [
      {
        userId: {
          type: String,
          required: true,
        },
        voteType: {
          type: String,
          enum: ["like", "dislike"],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Question =
  mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema);

export default Question;
