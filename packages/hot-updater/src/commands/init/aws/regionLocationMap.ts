import type { BucketLocationConstraint } from "@hot-updater/aws/sdk";

export const regionLocationMap: Record<
  | BucketLocationConstraint
  | "ap-southeast-4"
  | "ap-southeast-5"
  | "il-central-1"
  | "me-central-1",
  string
> = {
  EU: "Europe",
  "af-south-1": "Cape Town, South Africa",
  "ap-east-1": "Hong Kong",
  "ap-northeast-1": "Tokyo, Japan",
  "ap-northeast-2": "Seoul, South Korea",
  "ap-northeast-3": "Osaka, Japan",
  "ap-south-1": "Mumbai, India",
  "ap-south-2": "Hyderabad, India",
  "ap-southeast-1": "Singapore",
  "ap-southeast-2": "Sydney, Australia",
  "ap-southeast-3": "Jakarta, Indonesia",
  "ap-southeast-4": "Melbourne, Australia",
  "ap-southeast-5": "Auckland, New Zealand",
  "ca-central-1": "Montreal, Canada",
  "cn-north-1": "Beijing, China",
  "cn-northwest-1": "Ningxia, China",
  "eu-central-1": "Frankfurt, Germany",
  "eu-north-1": "Stockholm, Sweden",
  "eu-south-1": "Milan, Italy",
  "eu-south-2": "Spain",
  "eu-west-1": "Ireland",
  "eu-west-2": "London, UK",
  "eu-west-3": "Paris, France",
  "il-central-1": "Tel Aviv, Israel",
  "me-central-1": "UAE",
  "me-south-1": "Bahrain",
  "sa-east-1": "São Paulo, Brazil",
  "us-east-2": "Ohio, USA",
  "us-gov-east-1": "US Gov East (Virginia, USA)",
  "us-gov-west-1": "US Gov West (Oregon, USA)",
  "us-west-1": "California, USA",
  "us-west-2": "Oregon, USA",
};
