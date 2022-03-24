'use strict';

const artiPart1Data = [

  {
    'id': 'pr',
    'origin': 'France',
    'price': 2,
    'unit': 'kg',
    'quantity': 0,
    'inCart': false,
  },
  {
    'id': 'pj',
    'origin': 'France',
    'price': 2,
    'unit': 'kg',
    'quantity': 2.5,
    'inCart': false,
  },
  {
    'id': 'po',
    'origin': 'France',
    'price': 2,
    'unit': 'kg',
    'quantity': 1,
    'inCart': false,
  },
  {
    'id': 'or',
    'origin': 'Maroc',
    'price': 1.5,
    'unit': 'kg',
    'quantity': 2.5,
    'inCart': true,
  },
  {
    'id': 'av',
    'origin': 'Pérou',
    'price': 1.5,
    'unit': 'Pièce',
    'quantity': 0,
    'inCart': false,
  },
  {
    'id': 'fr',
    'origin': 'France',
    'price': 3,
    'unit': 'Barquette 250g',
    'quantity': 2,
    'inCart': false,
  },
  {
    'id': 'fr',
    'origin': 'France',
    'price': 5,
    'unit': 'Barquette 500g',
    'quantity': 3,
    'inCart': true,
  },
  {
    'id': 'fr',
    'origin': 'Espagne',
    'price': 8,
    'unit': 'Plateau 1kg',
    'quantity': 1,
    'inCart': true,
  },
  {
    'id': 'pa',
    'origin': 'Maroc',
    'price': 3,
    'unit': 'kg',
    'quantity': 0,
    'inCart': false,
  },

];

const integerUnits = {
  'kg': false,
  'g': false,
  'Pièce': true,
  'Barquette 250g': true,
  'Barquette 500g': true,
  'Plateau 1kg': true,
};