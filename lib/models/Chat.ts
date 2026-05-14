import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export interface IChat extends Document {
  title: string;
  messages: IMessage[];
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ChatSchema = new Schema<IChat>(
  {
    title: { type: String, default: 'New Chat' },
    messages: [MessageSchema],
    userId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
