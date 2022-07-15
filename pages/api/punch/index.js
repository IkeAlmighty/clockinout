import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  const { user, time, mode } = JSON.parse(req.body);

  try {
    const client = await clientPromise;

    const mongoPunchResponse = await client
      .db()
      .collection("punches")
      .insertOne({ user, time, mode });
  } catch (err) {
    res.status(500).end();
  }

  res.end();
}
