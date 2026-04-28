import { ComponentType } from "./types";

export interface BuildResult {
  version: string;
  components: ComponentType[];
  name: string;
  username: string;
  id: string;
}
