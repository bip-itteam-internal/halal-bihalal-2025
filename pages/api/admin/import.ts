import formidable from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { verifyAdmin } from '../../../utils/verifyAdmin';

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

const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields, files: formidable.Files }> => {
  const form = formidable({
    uploadDir: "./tmp",
    createDirsFromUploads: true,
    keepExtensions: true
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

const formatPhone = (phone: string): string => {
  phone = String(phone);
  
  if (phone.startsWith("08")) {
    phone = "628" + phone.substring(2);
  }
  phone = phone.replace(/\D/g, '');
  return phone;
};

const capitalizeEachWord = (name: string): string => {
  return name.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}

const transformData = (data: any[]): any[] => {
  return data.map(item => ({
    name: capitalizeEachWord(item["NAMA LENGKAP"]),
    phone: formatPhone(item["NO HP"]),
    shirt_size: item["UKURAN"],
    email: item["EMAIL"]
  }));
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  try {
    const { fields, files } = await parseForm(req);
    const file = files.file && files.file[0] as formidable.File;

    if (!file) {
      return res.status(400).json({ status: false, message: "No file uploaded" });
    }

    const fileBuffer = fs.readFileSync(file.filepath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const transformedData = transformData(data);

    fs.unlinkSync(file.filepath);

    res.status(200).json({ status: true, message: "Done", data: transformedData });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ status: false, message: err.message });
  }
}

export default verifyAdmin(handler);