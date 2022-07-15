import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  const { email } = req.query;
  const client = await clientPromise;

  const punches = await client
    .db()
    .collection("punches")
    .aggregate([
      { $match: { "user.email": email } },
      { $sort: { time: -1 } },
      { $addFields: { _id: { $toString: "$_id" } } },
    ])
    .toArray();

  res.json(punches);
}
