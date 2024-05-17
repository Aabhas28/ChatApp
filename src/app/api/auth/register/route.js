import User from "@/models/User";
import { connectToDB } from "@/mongoDB";
import { hash } from "bcryptjs";

export const POST = async (req) => {
  try {
    await connectToDB();

    const body = await req.json();
    const { username, email, password } = body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hashedPassword = await hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return new Response(JSON.stringify(newUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to create a new user" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
