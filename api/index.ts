import { app } from "../backend/app";

export default function handler(...args: Parameters<typeof app>) {
	return app(...args);
}
