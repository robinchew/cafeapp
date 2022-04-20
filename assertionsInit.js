function assertionsInit() {
  return {
    assert(tf, message) {
      if (! tf) {
        throw Error(message);
      }
    }
  };
}
