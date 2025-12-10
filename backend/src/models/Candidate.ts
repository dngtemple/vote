import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
    name: string;
    position: string;
    votes: number;
    noVotes: number;
}

const CandidateSchema: Schema = new Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
    votes: { type: Number, default: 0 },
    noVotes: { type: Number, default: 0 },
});

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
