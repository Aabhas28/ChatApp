import Chat from "@/models/Chat";
import User from "@/models/User";
import { connectToDB } from "@/mongoDB";

export const GET = async (req, { params }) => {
  try {
    await connectToDB();

    const { chatId } = params;

    console.log(chatId)

    const chat = await Chat.findById(chatId)
      .populate({
        path: "members",
        model: User,
      }).exec();

    return new Response(JSON.stringify(chat), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Failed to get chat details", { status: 500 });
  }
};