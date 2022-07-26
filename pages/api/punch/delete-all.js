import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    res.status(400).send("Only DELETE requests allowed");
    return;
  }

  const { email } = JSON.parse(req.body);

  if (!email) {
    res.status(400).send("user must be specified");
    return;
  }

  const client = await clientPromise;

  let deleteAllMongoResponse = await client
    .db()
    .collection("punches")
    .deleteMany({ "user.email": email });

  res.end();
}
