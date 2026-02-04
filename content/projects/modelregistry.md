+++
title = 'Model Registry'
subtitle = 'Trust Scoring for Hugging Face Models'
summary = 'A system for cataloging and scoring Hugging Face models on domain-specific reliability, beyond star counts and downloads.'
date = '2025-09-01'
tags = ["Python", "Algorithms"]
draft = false
+++

**Links:** [GitHub](https://github.com/rybkr/modelregistry)

## Overview

Model Registry is a system for cataloging Hugging Face models and evaluating them against a defined set of domain metrics. Rather than relying on download counts or star ratings, it produces a composite reliability and trustworthiness score based on measurable properties.

## Motivation

The Hugging Face ecosystem hosts thousands of models, but choosing one for production use involves guesswork. Star counts and README quality don't tell you whether a model generalizes, how it performs under distribution shift, or whether its outputs are consistent. Model Registry formalizes this evaluation.

## How It Works

- **Model ingestion**: Pull model metadata and weights from the Hugging Face Hub
- **Metric evaluation**: Run each model through a configurable set of domain-specific benchmarks
- **Scoring**: Aggregate results into a single reliability/trustworthiness score with per-metric breakdowns
- **Registry storage**: Persist scores and metadata for comparison and querying
