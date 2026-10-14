import pages from './pages';
import forms from './forms';
import shared from './shared';
import fields from './fields';
import types from './types';
import states from './states';
import transitions from './transitions';
import stateGraphs from './stateGraphs';
import messages from './messages';
import rule from './rule';
import navbar from './navbar';
import preferences from './preferences';
import tables from './tables';
import collection from './collection';

const ja = {
    pages,
    forms,
    shared,
    fields,
    types,
    states,
    transitions,
    stateGraphs,
    messages,
    rule,
    navbar,
    preferences,
    tables,
    collection,
} as const;

export default ja;
