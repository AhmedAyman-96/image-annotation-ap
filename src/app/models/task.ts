export interface Task {
  id: string;
  imageURL: string;
  status: string;
  assignedTo?: string;
  createdAt?: string;
  annotations?: { rectangle: any; annotation: string }[];
}
