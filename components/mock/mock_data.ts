export interface IData {
  id?: string;
  name: string;
  phone: string;
  department?: string;
  shirt_size: string;
  attendance?: {
    event_id: number;
    status: string;
    check_in_at: string;
  }[];
}

export const MOCK_DATA: IData[] = [
  {
    name: "Lauraine Woolner",
    phone: "+7-396-712-2707",
    department: "Services",
    shirt_size: "L"
  },
  {
    name: "Jillayne Woolmer",
    phone: "+84-666-565-8865",
    department: "Legal",
    shirt_size: "3XL"
  },
  {
    name: "Tessa Ridsdale",
    phone: "+505-947-775-0528",
    department: "Legal",
    shirt_size: "M"
  }
]