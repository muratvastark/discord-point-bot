import { model, Schema } from "mongoose";
import { IModel } from "my-module";

const schema = new Schema({
    id: String,
    points: {
        type: Number,
        default: 0,
    },
    invites: {
        type: Number,
        default: 0,
    },
    inviter: {
        type: Number,
        default: 0,
    },
    voices: {
        type: Object,
        default: {},
    },
    messages: {
        type: Object,
        default: {},
    },
});

export const Model = model<IModel>("Users", schema);
