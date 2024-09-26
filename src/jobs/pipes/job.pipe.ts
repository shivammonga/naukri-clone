import { Injectable } from "@nestjs/common";
import { JobApplicationsDto } from "../dto/job-applications.dto";
import { Types } from "mongoose";
import { PaginationDto } from "src/utils/dto/pagination.dto";

@Injectable()
export class JobPipe {
  jobApplications(jobApplicationsDto: JobApplicationsDto, recruiterId: string) {
    const pageSize = jobApplicationsDto.pageSize ?? 10;
    const page = jobApplicationsDto.page ?? 1;
    const skip = pageSize * (page - 1);

    let pipeline = [
      {
        $match: {
          jobId: Types.ObjectId.createFromHexString(jobApplicationsDto.jobId),
          jobPostedBy: recruiterId,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          list: [
            {
              $skip: skip,
            },
            {
              $limit: pageSize,
            },
            {
              $lookup: {
                from: "users",
                localField: "appliedBy",
                foreignField: "_id",
                as: "candidateDetails",
                pipeline: [
                  {
                    $project: {
                      email: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$candidateDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                candidateEmail: "$candidateDetails.email",
              },
            },
          ],
          count: [
            {
              $count: "count",
            },
          ],
        },
      },
    ] as Array<any>;
    return pipeline;
  }

  appliedJobs(paginationDto: PaginationDto, candidateId: string) {
    const pageSize = paginationDto.pageSize ?? 10;
    const page = paginationDto.page ?? 1;
    const skip = pageSize * (page - 1);

    let pipeline = [
      {
        $match: {
          appliedBy: candidateId,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          list: [
            {
              $skip: skip,
            },
            {
              $limit: pageSize,
            },
            {
              $lookup: {
                from: "jobs",
                localField: "jobId",
                foreignField: "_id",
                as: "jobDetails",
                pipeline: [
                  {
                    $project: {
                      title: 1,
                      description: 1,
                      postedBy: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$jobDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                jobTitle: "$jobDetails.title",
                jobDescription: "$jobDetails.description",
              },
            },
          ],
          count: [
            {
              $count: "count",
            },
          ],
        },
      },
    ] as any;
    return pipeline;
  }
}
