export function random(len: number) {
  let options =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let length = options.length;

  let result = "";

  for (let i = 0; i < len; i++) {
    result += options.charAt(Math.floor(Math.random() * length));
  }

  return result;
}

//@ts-ignore
export const wrapAsync = (fn: any) => {
  return function (req: any, res: any, next: any) {
    fn(req, res, next).catch((err: any) => next(err));
  };
};



