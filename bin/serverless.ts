#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { ServerlessStack } from '../lib/serverless-stack';
import {Tags} from "@aws-cdk/core";

const app = new cdk.App();
new ServerlessStack(app, 'ServerlessStack');
Tags.of(app).add('owner', 'nickolay.laptev@trilogy.com');
