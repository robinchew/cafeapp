function mainInit({
  assertions: {
    assert,
  },
  mithril: m,
  patchinko: O,
  ramda: {
    append,
    assoc,
    fromPairs,
    identity,
    includes,
    insert,
    last,
    map,
    mergeRight,
    reduce,
    sortBy,
    sum,
    unnest,
    uniq,
  },
  stream,
}) {
  const ENTER = 13;
  const mergeMany = reduce(mergeRight, {});

  function split() {
  }

  function logk(k, v) {
    console.log(k, v);
    return v;
  }

  function valuesAreUnique(arr) {
    return uniq(arr).length === arr.length;
  }

  function join(arr) {
    assert(arr.length >= 2, 'Must join only 2 or more items in array');
    return arr.slice(0, -1).join(', ') + ' and ' + last(arr);
  }

  // lm fw lb lat cap al oat soy lf x l r s 1 2 lf ice weak|wk chai mocha dirty esp haz van car

  const sizes = {
    small: {
      keys: ['s'],
      title: 'Small',
      calc: () => 4.5,
    },
    medium: {
      keys: ['m', 'r'],
      title: 'Medium',
      calc: () => 5,
    },
    large: {
      keys: ['l'],
      title: 'Large',
      calc: () => 5.5,
    },
  }

  const milk = {
    skim: {
      keys: ['sk', 'skinny', 'skim'],
    },
    ...map(obj => mergeRight(obj, { calc: v => v + 1 }), {
      oat: {
        keys: ['oat'],
        title: 'Oat',
      },
      soy: {
        keys: ['soy'],
        title: 'Soy',
      },
      almond: {
        keys: ['al'],
        title:'Almond'
      },
    }),
  };

  const coffeeVariation = {
    extraShot: {
      keys: ['x'],
      title: 'Extra Shot',
      calc: v => v + 0.5,
    },
    longMac: {
      keys: ['lm'],
      calc: v => v + 0.5,
      title: 'Long Macchiato',
    },
  }

  const extras = map(obj => mergeRight(obj, { calc: v => v + 0.5 }), {
    hazel: {
      keys: ['haz'],
      title: 'Hazelnut',
    },
    caramel: {
      keys: ['car'],
      title: 'Caramel',
    },
    honey: {
      keys: ['hon'],
      title: 'Honey',
    },
  });

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
    longBlack: {
      keys: ['lb', 'black'],
      title: 'Long Black',
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
    chai: {
      keys: ['chai'],
      title: 'Chai',
    },
    hotChoc: {
      keys: ['choc'],
      title: 'Hot Chocolate',
    },
  }

  const sugar = {
    oneTsp: {
      keys: ['1'],
      title: '1 tsp sugar',
    },
    twoTsp: {
      keys: ['2'],
      title: '2 tsp sugar',
    },
  };

  const order2 = [
    {
      title: 'Sizes',
      items: sizes,
      errors: {
        one_option_only: sizes => 'Pick just 1 size. You picked ' + join(sizes),
      },
      required: true,
      default: 'medium',
    },
    {
      title: 'Names',
      items: naming,
      errors: {
        one_option_only: names => 'Too many product names. You picked ' + join(names),
      },
    },
    {
      title: 'Milk',
      items: milk,
      errors: {
        one_option_only: types => 'Pick just 1 type of milk instead of ' + join(types),
      },
    },
    {
      title: 'Extra Coffee',
      items: coffeeVariation,
      errors: {
        one_option_only: () => 'Pick just 1',
      },
    },
    {
      title: 'Extras',
      items: extras,
      errors: {
        one_option_only: () => 'Pick just 1',
      },
    },
    {
      title: 'Sugar',
      items: sugar,
      errors: {
        one_option_only: () => 'Pick just 1',
      },
    },
  ];

  const order = order2.map(({ items }) => items);

  const lookup = order2.reduce((acc, obj) => {
    const l = Object.values(obj.items);
    return {
      ...acc,
      ...mergeMany(l.map(o => mergeMany(o.keys.map(key => ({ [key]: { ...o, group: obj, key } }))))),
    };
  }, {});

  function determine(variables) {
    const orderedKeys = unnest(unnest(order.map(obj => Object.values(obj).map(({ keys }) => {
      keys.forEach(key => assert(typeof key === 'string', `Keys must be string. '${key}' is not string.`));
      return keys;
    }))));
    assert(valuesAreUnique(orderedKeys), 'orderedKeys has duplicate values');

    const orderedVariables = sortBy(v => orderedKeys.indexOf(v), variables).map(v => {
      if (v === undefined) {
        throw Error('Undefined key for lookup');
      }
      const looked = lookup[v];
      if (looked === undefined) {
        throw Error(`Nothing in lookup for '${v}'`);
      }
      return looked;
    });

    const [completeVariables, otherVariables] = reduce(
      ([acc, rest], g) => {
        if (rest.length && g === rest[0].group) {
          return [append(rest[0], acc), rest.slice(1)];
        }
        if (g.required) {
          if (g.default) {
            return [append({ ...g.items[g.default], group: g }, acc), rest];
          }
          throw Error(`'${g.title}' group is required but unspecified!`);
        }
        return [acc, rest];
      },
      [[], orderedVariables],
      order2);

    assert(otherVariables.length === 0, 'Left over variables ' + otherVariables.map(({ title }) => title).join(' '));

    return reduce(
      (acc, v) => {
        const options = acc.usedOptions.filter(opt => opt.group === v.group);
        if (options.length >= 1) {
          throw Error(v.group.errors.one_option_only(options.map(({ key }) => key).concat([v.key])));
        }
        return {
          title: v.title ? ((acc.title ? acc.title + ' ' : '') + v.title) : acc.title,
          price: (v.calc || identity)(acc.price),
          usedOptions: append(v, acc.usedOptions),
        };
      },
      { title: '', price: 0, usedOptions: [] },
      completeVariables);
  }

  assert(determine(['cap']).price === 5, 'Price is not 5, maybe medium size is not assumed.');
  assert(determine(['moc', 'l']).price === 6, 'moc test');

  const orderList = `
    fw al
    skinny chai
    cap
    cap
    fw
    latte
    latte
    lm
    s lb x
    latte x
    lat car
    lat car
    lat car
    al lat
    chai oat
    lb hon
    fw al
    skim cap 1
    chai
    choc
    mocha l
  `;

  const determined = orderList
    .split('\n')
    .filter(s => s.replaceAll(' ', ''))
    .map(line => determine(line.split(' ').filter(identity)));

  logk('all', JSON.stringify(determined.map(d => d.title + ' = ' + d.price), null, ' '));
  logk('sum', sum(determined.map(d => d.price)));

  const update = stream();
  stream
    .scan(
      (model, f) => f(model),
      {
        text: orderList,
      },
      update)
    .map(model => render(model));

  function newInput(value) {
    update(mod => O(mod, { inputs: O(append('')) }));
  }

  function fillInput(i, value){
    console.log('fill', i, value);
    update(mod => O(mod, { inputs: O(assoc(i, value)) }));
  }

  function view(state) {
    return m('div',
      m('style', `
        body {
          margin:0;
        }
      `),
      m('table',
        {
          style: {
            height: '100%',
            width: '100%',
          },
        },
        m('tr',
          {
            style: {
            },
          },
          m('td',
            m('textarea', {
              style: {
                width: '100%',
                height: '100%',
              },
              oninput: e => fillInput(i, e.currentTarget.value),
              onkeyup: e => newInput(e.currentTarget.value),
              value: state.text,
            })),
          m('td', 00))));
  }

  function render(model) {
      m.render(document.body, view(model));
  }

  return {
    run() {
      //update(v => v);
    },
  }
}
