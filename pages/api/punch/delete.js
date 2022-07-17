import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const { _id1, _id2 } = JSON.parse(req.body);

  const client = await clientPromise;
  const mongoDeleteResponse = await client
    .db()
    .collection("punches")
    .remove({ _id: { $in: [new ObjectId(_id1), new ObjectId(_id2)] } });

  if (mongoDeleteResponse.deletedCount !== 2) {
    res.status(400).end();
  }
  res.end();
}
