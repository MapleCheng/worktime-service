const app = require("express")();
const bodyParser = require("body-parser");
const cors = require("cors");

const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());

app.use("/api/worktime/v2", require("./routes"));

app.listen(PORT, () => {
  console.log(`This service running in port ${PORT}`);
});
