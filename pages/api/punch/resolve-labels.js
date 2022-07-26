import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  // resolves a stack of label updates, ignoring repeat
  // _ids lower in the stack.
  const { stack } = JSON.parse(req.body);

  // key value object for recording which labels have been
  // updated already, so that they can be ignored:
  const ignore = {};

  try {
    const client = await clientPromise;

    for (let i = 0; i < stack.length; i++) {
      const label = stack[i];
      if (!ignore[label.punchInId]) {
        // update the label in the database:
        const updateLabelResponse = await client
          .db()
          .collection("punches")
          .updateOne(
            { _id: ObjectId(label.punchInId) },
            { $set: { label: label.value } }
          );
        ignore[label.punchInId] = true;
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).end();
    return;
  }

  res.end();
}
