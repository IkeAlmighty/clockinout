import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  const { email } = req.query;

  const client = await clientPromise;

  //
  const mongoLatestPunchesResponse = await client
    .db()
    .collection("punches")
    .aggregate([
      { $match: { "user.email": email } },
      { $sort: { time: -1 } },
      { $limit: 1 },
      { $addFields: { _id: { $toString: "$_id" } } }, //convert _id to string
    ])
    .toArray();

  if (mongoLatestPunchesResponse.length > 0) {
    const latestPunch = mongoLatestPunchesResponse[0];

    res.send(latestPunch.mode === "in" ? "out" : "in");
  } else {
    res.send("in"); // default to punch in if there are no punches recorded
  }
}
