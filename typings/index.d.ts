/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    currentUser: import("../src/types/api").AppUser | null
  }
}
