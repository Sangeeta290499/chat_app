//use of Data URIs is primarily to embed small resources directly into web pages, stylesheets, or scripts

import DataUriParser from "datauri/parser.js";
import path from "path";

const parser = new DataUriParser();

const getDataUri = (file) =>{  //file lega and use modify/change krke dega
    const extName = path.extname(file.originalname).toString();
    return parser.format(extName, file.buffer).content;
};
export default getDataUri;