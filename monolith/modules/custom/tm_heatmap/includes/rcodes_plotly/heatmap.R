args <- commandArgs(trailingOnly = TRUE)
suppressPackageStartupMessages(library(base64enc))
suppressPackageStartupMessages(library(data.table))
suppressPackageStartupMessages(library(RJSONIO))
suppressPackageStartupMessages(library(plotly))
suppressPackageStartupMessages(library(dplyr))
# random number set
set.seed(1776)
# inbound contract check
inboundContractCheck <- list()
# csv to dataframe
GetDataFrame <- function(csvPath, filesType = "csv") {
  tryCatch({
    df <- read.csv(file = csvPath, header = TRUE, na.string = c("", "NA"),
                   stringsAsFactors = TRUE, encoding = "Latin-1")
    df <- as.data.frame(df)
    # keep only complete rows
    complete.rows <- complete.cases(df)
    #df <- df[complete.rows,]
    df
  }, warning = function(war) {
    outputWarning = TRUE
    # warning handler picks up where warning was generated
    inboundContractCheck <<- append(inboundContractCheck, list("warning_reading_csv" = war))
  }, error = function(err) {
    outputError = TRUE
    # error handler picks up where error was generated
    inboundContractCheck <<- append(inboundContractCheck, list("error_reading_csv" = err))
  }) # End tryCatch
}
# coerce data types
convert.magic <- function(obj, types) {
  tryCatch({
    for (i in 1:length(obj)){
      FUN <- switch(types[i],character = as.character, numeric = as.numeric,
                    factor = as.factor, integer = as.integer, logical = as.logical)
      obj[,i] <- FUN(obj[,i])
    }
    obj
  }, warning = function(war) {
    outputWarning = TRUE
    # warning handler picks up where warning was generated
    inboundContractCheck <<- append(inboundContractCheck, list("warning_coerce" = war))
  }, error = function(err) {
    outputError = TRUE
    # error handler picks up where error was generated
    inboundContractCheck <<- append(inboundContractCheck, list("error_coerce" = err))
  }) # End tryCatch
}
json <- rawToChar(base64decode(args))
chartOptions <- fromJSON(json)
csvPath     <- chartOptions$csv_path
imgPath     <- chartOptions$img_path
colnames    <- chartOptions$x_col
colnames    <- strsplit(colnames,",")
colTypes    <- chartOptions$x_col_type
colTypes    <- strsplit(colTypes,",")
# make vector of columns
selectColumns <- c()
for (colname in colnames[[1]]) {
  selectColumns <- append(selectColumns, colname)
}
# make vector of columns coerse types
colsTypeCoerse <- c()
for (colType in colTypes[[1]]) {
  colsTypeCoerse <- append(colsTypeCoerse, colType)
}
f <- list(
  family = "Open Sans, verdana, arial, sans-serif",
  size = 16,
  color = "#444444"
)
# check if required number of arguments are available.
if (length(chartOptions) < 5) {
  inboundContractCheck <- append(inboundContractCheck, list("required_args_int" = 5))
  inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
  print(toJSON(inboundContractCheck))
  stop("Required arguments limit not meet.")
}
# get data frame from CSV
csvLoadTimeElapsed <- system.time(df <- GetDataFrame(paste0(csvPath)))
if(!is.data.frame(df)){
     toJSON(df)
 } else {
   # check if csv load successfully or stop execution
   if (length(inboundContractCheck[['error_reading_csv']]) > 0) {
     inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
     print(toJSON(inboundContractCheck))
     stop("error reading csv.")
   }
   # log csv load time
   inboundContractCheck <- append(inboundContractCheck,
                                  list("csv_load_time_elapsed" = csvLoadTimeElapsed[['elapsed']]))
   # log if csv loaded successfully
   if (nrow(df) > 0) {
     inboundContractCheck <- append(inboundContractCheck, list("csv_load_status" = TRUE))
     inboundContractCheck <- append(inboundContractCheck, list("csv_number_of_rows" = nrow(df)))
   } else {
     inboundContractCheck <- append(inboundContractCheck, list("csv_load_status" = FALSE))
     inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
     print(toJSON(inboundContractCheck))
     stop("CSV not loaded successfully.")
   }
   if (length(chartOptions$filters) > 0) {
     # generate a string of all filters
     filterStr <- ""
     filterfun <- function(x) {
       colname <- x[["colname"]]
       operator <- x[["operator"]]
       required_val <- x[["required_val"]]
       if (operator == "contains") {
         filterStr <- paste0("grepl('",required_val,"',",colname,",ignore.case = TRUE)")
       } else {
         required_val_modify1 <- ifelse(operator == "==" || operator == "!=",
                                       paste0(" '", required_val, "'"),
                                       paste0(" ", required_val))
         filterStr <- paste0(colname, " ", operator,
                           required_val_modify1)
       }
      }
     filterStr <- sapply(chartOptions$filters, FUN=filterfun)
     filterStr <- paste0(filterStr,collapse = " & ")
     # apply filters
     if (nchar(filterStr) > 0) {
       # apply log time
       filtersTimeElapsed <- system.time(
       dfFiltered <- df %>%
       filter_(filterStr))
       # log contains Filters Time
       inboundContractCheck <- append(inboundContractCheck,
                                      list("fillters_time_elapsed" =
                                           filtersTimeElapsed[['elapsed']]))
       # log if DF have observations after filters
       if(nrow(dfFiltered) > 1) {
         inboundContractCheck <- append(inboundContractCheck, list("nrows_after_filter" = TRUE))
         inboundContractCheck <- append(inboundContractCheck, list("nrows_after_filter_int" = nrow(dfFiltered)))
       } else {
         inboundContractCheck <- append(inboundContractCheck, list("nrows_after_filter" = FALSE))
         inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
         inboundContractCheck <- append(inboundContractCheck, list("nrows_after_filter_int" = nrow(dfFiltered)))
         print(toJSON(inboundContractCheck))
         stop("No rows left after applying filters.")
       }
      }
   } else {
     dfFiltered <- df
 }
 # select desired columns
 dfFiltered <- dfFiltered[selectColumns]
 # coerce types
 coerceTimeElapsed <- system.time(
   dfFiltered <- convert.magic(dfFiltered, colsTypeCoerse)
 )
 # check if coerce columns successfull or stop execution
 if(length(inboundContractCheck[['error_coerce']]) > 0) {
   inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
   print(toJSON(inboundContractCheck))
   stop("error coerce columns")
 }
 # log coerce time
 inboundContractCheck <- append(inboundContractCheck,
                                list("coerce_time_elapsed" =
                                       coerceTimeElapsed[['elapsed']]))
 if (nrow(dfFiltered) > 0) {
   outputWarning = FALSE
   outputError = FALSE
   tryCatch({
      dfToMatrix <- as.matrix(dfFiltered)
      storage.mode(dfToMatrix) <- "numeric"
      result <- try(
        chartGenerateTimeElapsed <- system.time (
        p <- plot_ly(z = dfToMatrix, colors = 'Paired', type = "heatmap")
        )
        , silent = TRUE)
      # Process any error messages
      if (class(result) == "try-error") {
        # Ignore warnings while processing errors
        options(warn = -1)

        # set output message to error
        outputError = TRUE

        # If this script were a function, warning() and stop()
        # could be called to pass errors upstream
        msg <- geterrmessage()
        inboundContractCheck <- append(inboundContractCheck, list("chart_generating_error" = msg))

        # Restore default warning reporting
        options(warn=0)
      } else {

        outputResult <- try(
          outputTimeElapsed <- system.time (
          htmlwidgets::saveWidget(p, imgPath, selfcontained = FALSE)),
          silent = TRUE)


        # Process any error messages
        if (class(outputResult) == "try-error") {
          # Ignore warnings while processing errors
          options(warn = -1)

          # set output message to error
          outputError = TRUE

          # If this script were a function, warning() and stop()
          # could be called to pass errors upstream
          msg <- geterrmessage()
          inboundContractCheck <- append(inboundContractCheck, list("output_error" = msg))

          # Restore default warning reporting
          options(warn=0)
        }

        # log chart generate time
        inboundContractCheck <- append(inboundContractCheck,
                                       list("chart_generate_time_elapsed" =
                                              chartGenerateTimeElapsed[['elapsed']]))

        # log output time
        inboundContractCheck <- append(inboundContractCheck,
                                       list("output_time_elapsed" =
                                              outputTimeElapsed[['elapsed']]))
      }

    }, warning = function(war) {
      outputWarning = TRUE
      # warning handler picks up where warning was generated
      inboundContractCheck <- append(inboundContractCheck, list("warning_output" = war))
    }, error = function(err) {
      outputError = TRUE
      # error handler picks up where error was generated
      inboundContractCheck <- append(inboundContractCheck, list("error_output" = err))

    }) # End tryCatch

    # output generated successfully
    if(! outputError) {
      inboundContractCheck <- append(inboundContractCheck, list("output" = TRUE))
    } else {
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
    }
    print(toJSON(inboundContractCheck))
 }
}


objList = list()
objList <- sapply(ls(), function(x)
  objList <- x
)
inboundContractCheck <- append(inboundContractCheck, list("objList" = objList))
inboundContractCheck <- append(inboundContractCheck, list("dfFiltered" = dfFiltered))
print(toJSON(inboundContractCheck))
