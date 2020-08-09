import { useState } from "../../web_modules/preact/hooks.js";

export const useForm = (defaultValues, callback) => {
  const [values, set] = useState(defaultValues);

  const onSubmit = (event) => {
    if (event) event.preventDefault();
    callback();
  };

  const onChange = (event) => {
    if ("persist" in event) {
      event.persist();
    }
    set((values) => ({
      ...values,
      [event.target.name]: event.target.value
    }));
  };

  const reset = () => {
    set(defaultValues);
  };

  return {
    onChange,
    onSubmit,
    reset,
    values
  };
};
