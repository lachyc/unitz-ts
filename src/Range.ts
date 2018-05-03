
import { Value } from './Value';
import { Transform } from './Transform';
import { Output } from './Output';


export type RangeMap = { [key: string]: Range };

export type RangeList = Range[];

export type RangeMutator = (range: Range) => Range;

export class Range
{

  public static INVALID: Range = new Range( Value.INVALID, Value.INVALID );
  public static SEPARATOR: string = ' - ';

  public readonly min: Value;
  public readonly max: Value;

  public constructor(min: Value, max: Value)
  {
    this.min = min.value < max.value ? min : max;
    this.max = max.value > min.value ? max : min;
  }

  public get isValid(): boolean
  {
    return this.min.isValid && this.max.isValid;
  }

  public get isFraction(): boolean
  {
    return this.min.isFraction || this.max.isFraction;
  }

  public get isDecimal(): boolean
  {
    return this.min.isDecimal && this.max.isDecimal;
  }

  public get isRange(): boolean
  {
    return this.min.value !== this.max.value;
  }

  public get isFixed(): boolean
  {
    return this.min.value === this.max.value;
  }

  public get average(): number
  {
    return (this.min.value + this.max.value) * 0.5;
  }

  public get value(): number
  {
    return this.min.value;
  }

  public get minimum(): number
  {
    return this.min.value;
  }

  public get maximum(): number
  {
    return this.max.value;
  }

  public get unit(): string
  {
    return this.min.group.unit;
  }

  public get asString(): string
  {
    return (this.min.value === this.max.value) ?
      (this.min.asString) :
      (this.min.asString + Range.SEPARATOR + this.max.asString);
  }

  public isMatch(range: Range): boolean
  {
    return this.min.group === range.min.group &&
      this.max.group === range.max.group;
  }

  public preferred(): Range
  {
    let min: Value = this.min.preferred();
    let max: Value = this.max.preferred();

    return new Range( min, max );
  }

  public positive(): Range
  {
    let minNegative: boolean = this.min.value < 0;
    let maxNegative: boolean = this.max.value < 0;

    if (maxNegative)
    {
      return null;
    }

    let min: Value = minNegative ? this.min.zero() : this.min.copy();
    let max: Value = this.max.copy();

    return new Range( min, max );
  }

  public negative(): Range
  {
    let minPositive: boolean = this.min.value >= 0;
    let maxPositive: boolean = this.max.value >= 0;

    if (minPositive)
    {
      return null;
    }

    let min: Value = this.min.copy();
    let max: Value = maxPositive ? this.max.zero() : this.max.copy();

    return new Range( min, max );
  }

  public nonzero(): Range
  {
    let minZero: boolean = this.min.value === 0;
    let maxZero: boolean = this.max.value === 0;

    if (minZero && maxZero)
    {
      return null;
    }

    let min: Value = this.min.copy();
    let max: Value = this.max.copy();

    return new Range( min, max );
  }

  public maxd(): Range
  {
    let fixed: Value = this.max.copy();

    return new Range(fixed, fixed);
  }

  public mind(): Range
  {
    let fixed: Value = this.min.copy();

    return new Range(fixed, fixed);
  }

  public normalize(transform: Transform, forOutput: Output): Range
  {
    let min: Value = this.min.normalize( transform, forOutput );
    let max: Value = this.max.normalize( transform, forOutput );

    return new Range(min, max)
  }

  public add(addend: Range, scale: number = 1): Range
  {
    let min: Value = this.min.add(addend.min, scale);
    let max: Value = this.max.add(addend.max, scale);

    return new Range(min, max);
  }

  public sub(subtrahend: Range, scale: number = 1): Range
  {
    let min: Value = this.min.sub(subtrahend.min, scale);
    let max: Value = this.max.sub(subtrahend.max, scale);

    return new Range(min, max);
  }

  public mul(scale: number): Range
  {
    let min: Value = this.min.mul(scale);
    let max: Value = this.max.mul(scale);

    return new Range(min, max);
  }

  public fractioned(): Range
  {
    if (this.min.isFraction && this.max.isFraction)
    {
      return this;
    }

    let min: Value = this.min.fractioned();
    let max: Value = this.max.fractioned();

    return new Range(min, max);
  }

  public numbered(): Range
  {
    if (!this.min.isFraction && !this.max.isFraction)
    {
      return this;
    }

    let min: Value = this.min.numbered();
    let max: Value = this.max.numbered();

    return new Range(min, max);
  }

  public static fromFixed(fixed: Value): Range
  {
    return new Range(fixed, fixed);
  }

}