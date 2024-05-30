const { Users } = require("../models");

const updateImage = async (req, res) => {
  let result = null;
  const { id, imageUrl } = req.body;
  if (!id || !imageUrl) return res.status(400).send("Credential Missing");
  result = await Users.update(
    { ProfileImage: imageUrl },
    { where: { id: id } }
  );
  if (result[0] > 0) return res.status(200).send("Uploading Success");
  else return res.status(400).send("Failed Uploading Photo");
};
const getUpdatedImage = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send("Id Missing");
  const image = await Users.findOne({
    where: { id: id },
    attributes: ["ProfileImage"],
  });
  if (!image.ProfileImage) return res.sendStatus(404);
  return res.status(202).send(image.ProfileImage);
};

module.exports = { updateImage, getUpdatedImage };
