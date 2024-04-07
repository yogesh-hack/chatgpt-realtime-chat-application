import express, { response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { openai } from "../index.js";

dotenv.config();
const router = express.Router();

router.post("/text", async (req, res) => {
  try {
    const { text, activeChatId } = req.body;
    console.log("text", text);

    const params = {
      messages: [{ role: 'user', content: text }],
      model: 'gemini-pro',
      prompt: text,
    };
    const model = openai.getGenerativeModel({ model: params.model});

    const prompt = params.prompt
  
    const result = await model.generateContent(prompt);
    // console.log(result)
    const responseText = await result.response.text();
    // res.json({text : responseText});
    // console.log(response.text());

    await axios.post(
      `https://api.chatengine.io/chats/${activeChatId}/messages/`,
      { text: responseText},
      {
        headers: {
          "Project-ID": process.env.PROJECT_ID,
          "User-Name": process.env.BOT_USER_NAME,
          "User-Secret": process.env.BOT_USER_SECRET,
        },
      }
    );
    // Send generated response to client
    res.json({ text: responseText });
    // res.status(200).json({ text: "Error 200.." });
    // res.status(404).json({ text: "Error 404.." });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/code", async (req, res) => {
  try {
    const { text, activeChatId } = req.body;

    const params = {
      messages: [{ role: 'user', content: text }],
      model: 'code-davinci-002',
      prompt: text,
      temperature: 0.5,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    };
    const response = await openai.chat.completions.create(params);
    res.json(response.data);

    await axios.post(
      `https://api.chatengine.io/chats/${activeChatId}/messages/`,
      { text: response.data.choices[0].text },
      {
        headers: {
          "Project-ID": process.env.PROJECT_ID,
          "User-Name": process.env.BOT_USER_NAME,
          "User-Secret": process.env.BOT_USER_SECRET,
        },
      }
    );

    res.status(200).json({ text: response.data.choices[0].text });
  } catch (error) {
    console.error("error", error.response.data.error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/assist", async (req, res) => {
  try {
    const { text } = req.body;
    
    const params = {
      messages: [{ role: 'user', content: text }],
      model: 'text-davinci-003',
      prompt: `Finish my thought: ${text}`,
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    };
    const response = await openai.chat.completions.create(params);
    res.json(response.data);

    res.status(200).json({ text: response.data.choices[0].text });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
