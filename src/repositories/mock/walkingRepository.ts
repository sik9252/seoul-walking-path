import { Course, WalkRecord } from "../../domain/types";
import { initialCourses, records } from "../../mocks/walkingData";

export type WalkingRepository = {
  getCourses: () => Promise<Course[]>;
  getRecords: () => Promise<WalkRecord[]>;
};

export const walkingRepository: WalkingRepository = {
  async getCourses() {
    return initialCourses;
  },
  async getRecords() {
    return records;
  },
};
