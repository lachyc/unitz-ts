// import { describe, it, expect } from 'jest';
import { uz } from '../Base'
import { Transform } from '../Transform';
import { System } from '../System';
import { Output, OutputFormat } from '../Output';
import { Classes } from '../Classes'
import { Rates } from '../Rates'

describe('Base', () => {

  Classes.addDefaults()
  Rates.addDefaults();

  it('parses ranges', () => {
    let u = uz('1 - 2 in^2, 23 1/4 lb')
    let r0 = u.ranges[0]
    let r1 = u.ranges[1]

    expect(u.ranges.length).toBe(2)

    expect(r0.min.value).toBe(1)
    expect(r0.min.unit).toBe('in^2')

    expect(r0.max.value).toBe(2)
    expect(r0.max.unit).toBe('in^2')

    expect(r1.min.value).toBe(23.25)
    expect(r1.min.unit).toBe('lb')
    expect(r1.min.num).toBe(23 * 4 + 1)
    expect(r1.min.den).toBe(4)
    expect(r1.min.mixedWhole).toBe(23)
    expect(r1.min.mixedNum).toBe(1)
  })

  it('scales', () => {
    let u = uz('1c, 1-2m')
    let u0 = u.ranges[0]
    let u1 = u.ranges[1]

    expect(u.ranges.length).toBe(2)

    expect(u0.min.value).toBe(1)
    expect(u0.min.unit).toBe('c')
    expect(u1.min.value).toBe(1)
    expect(u1.max.value).toBe(2)
    expect(u1.min.unit).toBe('m')
    expect(u1.max.unit).toBe('m')

    let s = u.scale(1.5)
    let s0 = s.ranges[0]
    let s1 = s.ranges[1]

    expect(s.ranges.length).toBe(2)

    expect(s0.min.value).toBe(1.5)
    expect(s0.min.unit).toBe('c')
    expect(s1.min.value).toBe(1.5)
    expect(s1.max.value).toBe(3.0)
    expect(s1.min.unit).toBe('m')
    expect(s1.max.unit).toBe('m')
  })

  it('positive', () => {
    let u = uz('-1c, 1-2m')
    let u0 = u.ranges[0]
    let u1 = u.ranges[1]

    expect(u.ranges.length).toBe(2)

    expect(u0.min.value).toBe(-1)
    expect(u0.min.unit).toBe('c')
    expect(u1.min.value).toBe(1)
    expect(u1.max.value).toBe(2)
    expect(u1.min.unit).toBe('m')
    expect(u1.max.unit).toBe('m')

    let s = u.positive()
    let s0 = s.ranges[0]

    expect(s.ranges.length).toBe(1)

    expect(s0.min.value).toBe(1)
    expect(s0.max.value).toBe(2)
    expect(s0.min.unit).toBe('m')
    expect(s0.max.unit).toBe('m')
  })

  it('half positive', () => {
    let u = uz('-1c, -1-2m')
    let u0 = u.ranges[0]
    let u1 = u.ranges[1]

    expect(u.ranges.length).toBe(2)

    expect(u0.min.value).toBe(-1)
    expect(u0.min.unit).toBe('c')
    expect(u1.min.value).toBe(-1)
    expect(u1.max.value).toBe(2)
    expect(u1.min.unit).toBe('m')
    expect(u1.max.unit).toBe('m')

    let s = u.positive()
    let s0 = s.ranges[0]

    expect(s.ranges.length).toBe(1)

    expect(s0.min.value).toBe(0)
    expect(s0.max.value).toBe(2)
    expect(s0.min.unit).toBe('m')
    expect(s0.max.unit).toBe('m')
  })

  it('negative', () => {

    expect( uz('-1c, 1-2m').negative().output() ).toBe('-1c');
    expect( uz('-1c, -1-2m').negative().output() ).toBe('-1c, -1 - 0m');
  })

  it('max', () => {
    let u = uz('-1c, 1-2m')
    let u0 = u.ranges[0]
    let u1 = u.ranges[1]

    expect(u.ranges.length).toBe(2)

    expect(u0.min.value).toBe(-1)
    expect(u0.min.unit).toBe('c')
    expect(u1.min.value).toBe(1)
    expect(u1.max.value).toBe(2)
    expect(u1.min.unit).toBe('m')
    expect(u1.max.unit).toBe('m')

    let s = u.max()
    let s0 = s.ranges[0]
    let s1 = s.ranges[1]

    expect(s.ranges.length).toBe(2)

    expect(s0.min.value).toBe(-1)
    expect(s0.min.unit).toBe('c')
    expect(s1.min.value).toBe(2)
    expect(s1.min.unit).toBe('m')
  })

  it('compact', () => {
    let u = uz('6oz, 1lb')
    let u0 = u.ranges[0]
    let u1 = u.ranges[1]

    expect(u.ranges.length).toBe(2)

    expect(u0.min.value).toBe(6)
    expect(u0.min.unit).toBe('oz')
    expect(u1.min.value).toBe(1)
    expect(u1.min.unit).toBe('lb')

    let s = u.compact()

    expect(s.ranges.length).toBe(1)

    expect(s.normalize().output()).toBe('22oz')
  })

  it('expand', () => {

    expect( uz('24oz').expand().output() ).toBe('1lb, 8oz');
    expect( uz('2345.4 lbs').expand().output({significant: 2}) ).toBe('1ton, 345lb, 6.4oz');
  })

  it('normalize', () => {

    expect(uz('1.5 lb').normalize().output()).toBe('24oz');
    expect(uz('32oz').normalize().output()).toBe('2lb');
  })

  it('convert', () => {

    expect(uz('1.5 lb').convert('oz').value).toBe(24);
    expect(uz('1 - 2lb').convert('oz').maximum).toBe(32);
    expect(uz('1 - 2lb').convert('oz').minimum).toBe(16);
    expect(uz('60 mph').to('mi/min').value).toBe(1);
  })

  it('normalize / transform', () => {

    let OUT = new Output();
    OUT.significant = 1;

    let METRIC = new Transform();
    METRIC.system = System.METRIC;
    METRIC.min = 0.01;

    expect(uz('23oz').normalize(METRIC).output(OUT)).toBe('652g');

    let US = new Transform();
    US.system = System.US;
    US.min = 0.01;

    expect(uz('652g').normalize(US).output(OUT)).toBe('1.4lb');
  })

  it('add match', () => {
    let a = uz('1oz');
    let b = uz('1lb, 3oz');
    let c = a.add(b);

    expect( c.output() ).toBe( '4oz, 1lb' );
  })

  it('add mismatch', () => {
    let a = uz('1oz');
    let b = uz('1lb');
    let c = a.add(b);

    expect( c.output() ).toBe( '1oz, 1lb' );
  })

  it('add perfect match', () => {
    let a = uz('1oz');
    let b = uz('4oz');
    let c = a.add(b);

    expect( c.output() ).toBe( '5oz' );
  })

  it('sort', () => {

    expect( uz('1oz, 1g, 1lb').sort().output() ).toBe('1lb, 1oz, 1g');
  })

  it('min', () => {

    expect( uz('1-2g, 4oz, 4-5lb').min().output() ).toBe('1g, 4oz, 4lb');
  })

  it('max', () => {

    expect( uz('1-2g, 4oz, 4-5lb').max().output() ).toBe('2g, 4oz, 5lb');
  })

  it('dynamic', () => {

    let outputOptions = {
      unitSpacer: ' '
    };

    let a = uz('1 loaf').add('2 loaves');

    expect( a.output(outputOptions) ).toBe('3 loaves');
  });

  it('conversions', () => {

    expect(
      uz('1oz, 1lb').
      conversions({min: 0.01, max: 1000}).
      output({format: OutputFormat.NUMBER, significant: 2})
    ).toBe( '17oz, 1.06lb' );
  });

  it('filter', () => {

    expect(
      uz('1oz, 1lb, 2').
      filter({
        groupless: false,
        onlyUnits: ['oz']
      }).
      output()
    ).toBe( '1oz' );
  });
})
