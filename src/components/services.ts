export interface SeleniumCodeResponse {
  errorCode?: string;
  message?: boolean;
  result?: string;
}

export const generateSeleniumCode = async (
  uniqueId: string
): Promise<SeleniumCodeResponse> => {
  const response = await fetch(
    "http://172.18.104.22:5001/api/TestNova/generateseleniumcode?uniqueId=" +
      uniqueId,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const runSeleniumCode = async (
  uniqueId: string
): Promise<SeleniumCodeResponse> => {
  const response = await fetch(
    "http://172.18.104.22:5001/api/TestNova/initiatetestrun?uniqueId=" +
      uniqueId,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
