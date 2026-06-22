import { sendReply, sendText } from "../lib/message.js";
import { isOwner } from "../lib/utils.js";

export const groupPlugins = [
  {
    command: ["kick", "remove"],
    description: "Kick a member from the group",
    category: "group",
    groupOnly: true,
    adminOnly: true,
    handler: async (sock, msg, { args, sendReply: reply, jid, sender }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
      const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const target = quoted || mentionedJids[0] || (args[0] ? `${args[0].replace(/\D/g, "")}@s.whatsapp.net` : null);
      if (!target) return reply("Tag or reply to the member to kick.");
      if (isOwner(target)) return reply("Cannot kick the bot owner.");
      await sock.groupParticipantsUpdate(jid, [target], "remove");
      await reply("Member removed from group.");
    },
  },
  {
    command: ["add"],
    description: "Add a member to the group",
    category: "group",
    groupOnly: true,
    adminOnly: true,
    handler: async (sock, msg, { args, sendReply: reply, jid }) => {
      if (!args[0]) return reply("Usage: .add <phone number>");
      const target = `${args[0].replace(/\D/g, "")}@s.whatsapp.net`;
      await sock.groupParticipantsUpdate(jid, [target], "add");
      await reply("Member added.");
    },
  },
  {
    command: ["promote"],
    description: "Promote member to admin",
    category: "group",
    groupOnly: true,
    adminOnly: true,
    handler: async (sock, msg, { args, sendReply: reply, jid, msg: rawMsg }) => {
      const mentionedJids = rawMsg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const target = mentionedJids[0] || (args[0] ? `${args[0].replace(/\D/g, "")}@s.whatsapp.net` : null);
      if (!target) return reply("Tag the member to promote.");
      await sock.groupParticipantsUpdate(jid, [target], "promote");
      await reply("Member promoted to admin.");
    },
  },
  {
    command: ["demote"],
    description: "Demote admin to member",
    category: "group",
    groupOnly: true,
    adminOnly: true,
    handler: async (sock, msg, { args, sendReply: reply, jid, msg: rawMsg }) => {
      const mentionedJids = rawMsg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const target = mentionedJids[0] || (args[0] ? `${args[0].replace(/\D/g, "")}@s.whatsapp.net` : null);
      if (!target) return reply("Tag the admin to demote.");
      await sock.groupParticipantsUpdate(jid, [target], "demote");
      await reply("Admin demoted to member.");
    },
  },
  {
    command: ["tagall", "everyone"],
    description: "Tag all group members",
    category: "group",
    groupOnly: true,
    adminOnly: false,
    handler: async (sock, msg, { sendReply: reply, jid }) => {
      const meta = await sock.groupMetadata(jid);
      const members = meta.participants.map((p) => p.id);
      const mentions = members;
      const text = `*Attention everyone!*\n\n${members.map((m) => `@${m.split("@")[0]}`).join("\n")}`;
      await sock.sendMessage(jid, { text, mentions }, { quoted: msg });
    },
  },
  {
    command: ["groupinfo", "ginfo"],
    description: "Get group information",
    category: "group",
    groupOnly: true,
    adminOnly: false,
    handler: async (sock, msg, { sendReply: reply, jid }) => {
      const meta = await sock.groupMetadata(jid);
      const admins = meta.participants.filter((p) => p.admin);
      const text = [
        `*Group Info*`,
        ``,
        `Name: ${meta.subject}`,
        `ID: ${meta.id}`,
        `Members: ${meta.participants.length}`,
        `Admins: ${admins.length}`,
        `Description: ${meta.desc || "None"}`,
        `Created: ${new Date(meta.creation * 1000).toLocaleDateString()}`,
      ].join("\n");
      await reply(text);
    },
  },
  {
    command: ["mute"],
    description: "Mute the group (admins only messaging)",
    category: "group",
    groupOnly: true,
    adminOnly: true,
    handler: async (sock, msg, { sendReply: reply, jid }) => {
      await sock.groupSettingUpdate(jid, "announcement");
      await reply("Group muted — only admins can send messages.");
    },
  },
  {
    command: ["unmute"],
    description: "Unmute the group",
    category: "group",
    groupOnly: true,
    adminOnly: true,
    handler: async (sock, msg, { sendReply: reply, jid }) => {
      await sock.groupSettingUpdate(jid, "not_announcement");
      await reply("Group unmuted — everyone can send messages.");
    },
  },
];
