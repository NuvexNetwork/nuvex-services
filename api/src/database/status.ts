export interface DatabaseStatus {
  connected: false;
  reason: string;
}

export function databaseStatus(): DatabaseStatus {
  return {
    connected: false,
    reason: "The API does not open a database connection in Milestone 0.",
  };
}
