export default function timestampToDateString(
  timestamp: number,
  { withSeconds = false, withUTC = true }: { withSeconds?: boolean; withUTC?: boolean } = {}, // default empty object
): string {
  const date = new Date(timestamp * 1000);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
  const year = date.getFullYear();

  const hours = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = date.getHours() >= 12 ? "PM" : "AM";

  const formattedTime = !withSeconds
    ? `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`
    : `${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;

  // Offset for the *given date* (handles DST)
  const offsetMinutes = -date.getTimezoneOffset(); // east is positive
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const oh = String(Math.floor(abs / 60)).padStart(2, "0");
  const om = String(abs % 60).padStart(2, "0");
  const offset = `UTC${sign}${oh}:${om}`;

  if (!withUTC) {
    return `${day}.${month}.${year} ${formattedTime}`;
  }

  return `${day}.${month}.${year} ${formattedTime} (${offset})`;
}
