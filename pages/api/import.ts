import formidable from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import * as XLSX from "xlsx";

import * as fs from "fs";
import * as path from "path";


type ResponseData = {
  status: boolean;
  message: string,
  data?: any
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {

  if (req.method != 'POST')
    return res.status(405).json({ status: false, message: 'Method not allowed' })

  // Parse form data (including file upload)
  const form = formidable({
    uploadDir: "./tmp",
    createDirsFromUploads: true,
    keepExtensions: true
  });

  form.parse(req, async (err, fields, files) => {
    if (err)
      return res.status(500).json({ status: false, message: err.message });

    const file = files.file && files.file[0] as formidable.File

    if (!file)
      return res.status(400).json({ status: false, message: "No file uploaded" });


    try {
      // Read file buffer
      const fileBuffer = fs.readFileSync(file.filepath);

      // Parse Excel file
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0]; // Get first sheet
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert to JSON

      console.log({ data })

      res.status(200).json({ status: true, message: "Done", data }); // Return parsed data
    } catch (error) {
      const err = error as Error
      res.status(500).json({ status: false, message: err.message });
    }
  });
}