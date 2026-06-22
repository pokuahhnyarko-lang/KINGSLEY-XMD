import axios from "axios";
import { sendReply, sendImage } from "../lib/message.js";
import { randomChoice } from "../lib/utils.js";

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "Why can't you give Elsa a balloon? She'll let it go.",
  "What do you call a fake noodle? An impasta.",
  "I would tell you a chemistry joke but I know I wouldn't get a reaction.",
  "Why don't programmers like nature? It has too many bugs.",
  "How do you comfort a JavaScript bug? You console it.",
  "Why did the developer go broke? Because he used up all his cache.",
];

const facts = [
  "A day on Venus is longer than a year on Venus.",
  "Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs.",
  "Bananas are berries, but strawberries are not.",
  "A group of flamingos is called a flamboyance.",
  "The shortest war in history lasted 38 to 45 minutes.",
  "Crows can recognize and remember human faces.",
  "Water can boil and freeze at the same time — it's called the triple point.",
];

const quotes = [
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Innovation distinguishes between a leader and a follower. — Steve Jobs",
  "Stay hungry, stay foolish. — Steve Jobs",
  "Code is like humor. When you have to explain it, it's bad. — Cory House",
  "The best error message is the one that never shows up. — Thomas Fuchs",
];

export const funPlugins = [
  {
    command: ["joke", "jokes"],
    description: "Get a random joke",
    category: "fun",
    ownerOnly: false,
    handler: async (sock, msg, { sendReply: reply }) => {
      await reply(randomChoice(jokes));
    },
  },
  {
    command: ["fact", "funfact"],
    description: "Get a random fun fact",
    category: "fun",
    ownerOnly: false,
    handler: async (sock, msg, { sendReply: reply }) => {
      await reply(randomChoice(facts));
    },
  },
  {
    command: ["quote"],
    description: "Get an inspirational quote",
    category: "fun",
    ownerOnly: false,
    handler: async (sock, msg, { sendReply: reply }) => {
      await reply(randomChoice(quotes));
    },
  },
  {
    command: ["8ball"],
    description: "Ask the magic 8-ball",
    category: "fun",
    ownerOnly: false,
    handler: async (sock, msg, { args, sendReply: reply }) => {
      const question = args.join(" ");
      if (!question) return reply("Ask a question! Usage: .8ball <question>");
      const answers = [
        "It is certain.", "It is decidedly so.", "Without a doubt.", "Yes, definitely.",
        "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.",
        "Signs point to yes.", "Reply hazy, try again.", "Ask again later.",
        "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.",
        "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.",
        "Very doubtful.", "Absolutely not!",
      ];
      await reply(`Question: ${question}\n\nAnswer: ${randomChoice(answers)}`);
    },
  },
  {
    command: ["roll", "dice"],
    description: "Roll a dice",
    category: "fun",
    ownerOnly: false,
    handler: async (sock, msg, { args, sendReply: reply }) => {
      const sides = parseInt(args[0]) || 6;
      const result = Math.floor(Math.random() * sides) + 1;
      await reply(`Rolled a ${sides}-sided dice: *${result}*`);
    },
  },
  {
    command: ["flip", "coinflip"],
    description: "Flip a coin",
    category: "fun",
    ownerOnly: false,
    handler: async (sock, msg, { sendReply: reply }) => {
      await reply(Math.random() < 0.5 ? "Heads!" : "Tails!");
    },
  },
  {
    command: ["choose", "pick"],
    description: "Choose between options",
    category: "fun",
    ownerOnly: false,
    handler: async (sock, msg, { args, sendReply: reply }) => {
      if (args.length < 2) return reply("Usage: .choose option1 option2 ...");
      const choice = randomChoice(args);
      await reply(`I choose: *${choice}*`);
    },
  },
  {
    command: ["calculate", "calc"],
    description: "Calculate a math expression",
    category: "fun",
    ownerOnly: false,
    handler: async (sock, msg, { args, sendReply: reply }) => {
      const expr = args.join(" ").replace(/[^0-9+\-*/.()%^ ]/g, "");
      if (!expr) return reply("Usage: .calc <expression>\nExample: .calc 10 * 5 + 3");
      try {
        const result = Function(`"use strict"; return (${expr})`)();
        await reply(`${expr} = *${result}*`);
      } catch {
        await reply("Invalid expression.");
      }
    },
  },
];
