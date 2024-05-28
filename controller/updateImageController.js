const { Users } = require("../models");

const updateImage = async (req, res) => {
  let result = null;
  const { id, imageUrl } = req.body;
  if (!id || !imageUrl) return res.status(400).send("Credentail Missing");
  else {
    result = await Users.update(
      { ProfileImage: imageUrl },
      { where: { id: id } }
    );
  }
  if (result[0] > 0) return res.status(200).send("Successfully Changed");
  else return res.status(400).send("Failed Uploading Photo");
};
module.exports = { updateImage };
