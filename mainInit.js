function mainInit({
  assertions: {
    assert,
  },
  ramda: {
    fromPairs,
    identity,
    map,
    mergeRight,
    reduce,
    sortBy,
    unnest,
    uniq,
  },
}) {
  const mergeMany = reduce(mergeRight, {});

  function logk(k, v) {
    console.log(k, v);
    return v;
  }

  // lm fw lb lat cap al oat soy lf x l r s 1 2 lf ice weak|wk chai mocha dirty esp haz van car

  const sizes = {
    small: {
      keys: ['s'],
      calc: () => 4.5,
    },
    medium: {
      keys: ['m', 'r'],
      calc: () => 5,
    },
    large: {
      keys: ['l'],
      calc: () => 5.5,
    },
  }

  const milk = map(obj => mergeRight(obj, { calc: v => v + 1 }), {
    oat: {
      keys: ['oat'],
    },
    soy: {
      keys: ['soy'],
    },
    almond: {
      keys: ['al'],
    },
  });

  const coffeeVariation = {
    extraShot: {
      keys: ['x'],
      calc: v => v + 0.5,
    },
    mocha: {
      keys: ['moc', 'mocha'],
      title: 'Mocha',
      calc: v => v + 0.5
    },
    dirtyChai: {
      keys: ['dirty'],
      title: 'Dirty Chai',
      calc: v => v + 0.5,
    },
  }

  const extras = {
    hazel: {
      keys: ['haz'],
      title: 'Hazelnut',
      calc: v => v + 0.5,
    },
  }

  const naming = {
    flatWhite: {
      keys: ['fw', 'flat'],
      title: 'Flat White',
    },
    latte: {
      keys: ['latte', 'lat'],
      title: 'Latte',
    },
    cappucino: {
      keys: ['cap',],
      title: 'Cappucino',
    },
  }

  const order = [
    naming,
    sizes,
    milk,
    coffeeVariation,
    extras,
  ];

  const lookup = order.reduce((acc, obj) => {
    const l = Object.values(obj);
    return {
      ...acc,
      ...mergeMany(l.map(o => mergeMany(o.keys.map(key => ({ [key]: o }))))),
    };
  }, {});

  console.log('lk', lookup);

  function valuesAreUnique(arr) {
    return uniq(arr).length === arr.length;
  }

  function determine(variables) {
    const orderedKeys = unnest(unnest(order.map(obj => Object.values(obj).map(({ keys }) => keys))));
    assert(valuesAreUnique(orderedKeys), 'orderedKeys has duplicate values');

    const orderedVariables = sortBy(v => orderedKeys.indexOf(v), variables);
    //const sorted 
    // variables.

    return reduce(
      (acc, v) => ({
        title: lookup[v].title ? ((acc.title ? acc.title + ' ' : '') + lookup[v].title) : acc.title,
        price: (lookup[v].calc || identity)(acc.price)
      }),
      { title: '', price: 0 },
      orderedVariables);
  }

  logk('calc', determine(['fw', 'oat', 'r', 'x', 'l', 'haz']))

  return {
  }
}
