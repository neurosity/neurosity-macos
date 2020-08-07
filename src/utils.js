const { pipe, of, empty } = require("rxjs");
const { flatMap, map, tap } = require("rxjs/operators");

function incrementalBuffer({ maxItems, minItems, incrementCountBy }) {
  let buffer = [];
  let emitCountdown = minItems || incrementCountBy;

  return pipe(
    flatMap((item) => {
      buffer.push(item);
      emitCountdown--;

      if (emitCountdown === 0) {
        emitCountdown = incrementCountBy;
        buffer = buffer.slice(-maxItems);
        return of(buffer);
      }

      return empty();
    })
  );
}

function averageScoreBuffer(maxItems = 15, minItems = 1) {
  return pipe(
    //tap((metric) => console.log(metric)),
    map((metric) => metric.probability),
    incrementalBuffer({
      maxItems,
      minItems,
      incrementCountBy: 1
    }),
    map((probabilities) => {
      return (
        probabilities.reduce((acc, probability) => acc + probability) /
        probabilities.length
      );
    }),
    map((average) => Math.round(average * 100))
  );
}

function getTextProgress(percentage = 50) {
  const value = Math.ceil(percentage / 10) * 10;
  return Array.from({ length: 10 }, (_, i) => {
    return value <= i * 10 ? "░" : "█";
  }).join("");
}

module.exports = {
  incrementalBuffer,
  averageScoreBuffer,
  getTextProgress
};
