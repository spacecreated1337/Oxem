const requestUrl = "https://hookb.in/eK160jgYJ6UlaRPldJ1P";

export const sendFormRequest = async (formData) => {
  return await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
    .then((response) => response.json());
};