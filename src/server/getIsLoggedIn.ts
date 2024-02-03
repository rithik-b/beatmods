import { api } from "@beatmods/trpc/server"

export default async function getIsLoggedIn() {
  try {
    await api.user.user.query()
    return true
  } catch (e) {
    return false
  }
}
