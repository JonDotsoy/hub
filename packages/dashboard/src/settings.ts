import { get } from "@jondotsoy/utils-js/get"

export const settings = {
  hub: {
    url: get.string(process.env, "HUB_URL"),
  }
}
