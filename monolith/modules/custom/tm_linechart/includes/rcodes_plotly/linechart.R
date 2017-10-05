args <- commandArgs(trailingOnly = TRUE)
suppressPackageStartupMessages(library(base64enc))
suppressPackageStartupMessages(library(data.table))
suppressPackageStartupMessages(library(RJSONIO))
suppressPackageStartupMessages(library(plotly))
suppressPackageStartupMessages(library(dplyr))
suppressPackageStartupMessages(library(ISLR))
# random number set
set.seed(1776)
# inbound contract check
inboundContractCheck <- list()
GetDataFrame <- function(csvPath, filesType = "csv") {
  tryCatch({
    df <- read.csv(file = csvPath, header = TRUE, na.string = c("", "NA"),
                   stringsAsFactors = TRUE,
                   encoding = "Latin-1")
    df <- as.data.frame(df)
    # keep only complete rows
    complete.rows <- complete.cases(df)
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
      FUN <- switch(types[i],character = as.character, 
                    numeric = as.numeric, 
                    factor = as.factor,
                    integer = as.integer,
                    logical = as.logical)
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
xCol        <- chartOptions$x_col
yCol        <- chartOptions$y_col
zCol        <- chartOptions$z_col
colorCol    <- chartOptions$color_col
textCol    <- chartOptions$text_col
xColType    <- chartOptions$x_col_type
yColType    <- chartOptions$y_col_type
zColType    <- chartOptions$z_col_type
colorColType    <- chartOptions$color_col_type
textColType    <- chartOptions$text_col_type
xTitle      <- chartOptions$x_title
yTitle      <- chartOptions$y_title
zTitle      <- chartOptions$z_title
colorCol <- ifelse(colorCol == "", "emptycol", colorCol)
textCol <- ifelse(textCol == "", "emptycol", textCol)
xTitle <- ifelse(xTitle == "", "X Col", xTitle)
yTitle <- ifelse(yTitle == "", "Y Col", yTitle)
zTitle <- ifelse(zTitle == "", "Z Col", zTitle)
f <- list(family = "Open Sans, verdana, arial, sans-serif", size = 16,
          color = "#444444")
x <- list(title = xTitle, titlefont = f)
y <- list(title = yTitle, titlefont = f)
z <- list(title = zTitle, titlefont = f)
axisf <- list(family = "Open Sans, verdana, arial, sans-serif", size = 10,
              color = "#444444")
scene = list(xaxis = list(title = xTitle, titlefont = axisf),
             yaxis = list(title = yTitle, titlefont = axisf),
             zaxis = list(title = zTitle, titlefont = axisf),
             camera = list(eye = list(x = 1.5, y = 1.7, z = 1.5)))
# check if required number of arguments are available.
if (length(chartOptions) < 7) {
  inboundContractCheck <- append(inboundContractCheck, 
                                 list("required_args_int" = 7))
  inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
  print(toJSON(inboundContractCheck))
  stop("Required arguments limit not meet.")
}
# get data frame from CSV
csvLoadTimeElapsed <- system.time(df <- GetDataFrame(paste0(csvPath)))
if (!is.data.frame(df)) {
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
                                 list("csv_load_time_elapsed" =
                                      csvLoadTimeElapsed[['elapsed']]))
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
  if(length(chartOptions$filters) > 0) {
    # generate a string of all filters
    filterStr <- ""
    filterfun <- function(x) {
      colname <- x[["colname"]]
      operator <- x[["operator"]]
      required_val <- x[["required_val"]]
      if (operator == "contains") {
        filterStr <- paste0("grepl('",required_val,"',",colname,",ignore.case = TRUE)")
      } else {
        required_val_modify <- ifelse(operator == "==" || operator == "!=",
                                       paste0(" '", required_val, "'"),
                                       paste0(" ", required_val))
        filterStr <- paste0(colname, " ", operator,
                                  required_val_modify)
      }
    }
    filterStr <- sapply(chartOptions$filters, FUN=filterfun)
    filterStr <- paste0(filterStr,collapse = " & ")
    # apply numeric filters
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
      if (nrow(dfFiltered) > 1) {
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
     }else {
      dfFiltered <- df
    }
    # handle optional column
    if (colorCol == "emptycol" && textCol=="emptycol") {
      dfFiltered <- dfFiltered %>%
      select(xCol, yCol, zCol)
      # coerce types
      coerceTimeElapsed <- system.time(
        dfFiltered <- convert.magic(dfFiltered, c(xColType, yColType, zColType)))
    } else if (colorCol == "emptycol" && textCol != "emptycol") {
      dfFiltered <- dfFiltered %>%
      select(xCol, yCol, zCol,textCol)
      # coerce types
      coerceTimeElapsed <- system.time(
        dfFiltered <- convert.magic(dfFiltered, c(xColType, yColType, zColType,textColType)))
    } else if (colorCol != "emptycol" && textCol == "emptycol") {
      dfFiltered <- dfFiltered %>%
      select(xCol, yCol, zCol,colorCol)
      # coerce types
      coerceTimeElapsed <- system.time(
        dfFiltered <- convert.magic(dfFiltered, c(xColType, yColType, zColType,colorColType)))
     } else {
       dfFiltered <- dfFiltered %>%
       select(xCol, yCol, zCol, colorCol,textCol)
       # coerce types
       coerceTimeElapsed <- system.time(
       dfFiltered <- convert.magic(dfFiltered, c(xColType, yColType, zColType, colorColType,textColType)))
    }
    # check if color col levels are less than 3.
    if (colorCol != "emptycol") {
      if (colorColType == "factor" & (
        nrow(unique(dfFiltered[colorCol])) < 3 |
        nrow(unique(dfFiltered[colorCol])) > 10)) {
        inboundContractCheck <- append(inboundContractCheck, list("color_col_require_minimum_three_levels" = TRUE))
        inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
        print(toJSON(inboundContractCheck))
        stop("color col levels are less than 3.")
      }
    }
    # check if both columns unique length is one
    if (nrow(unique(dfFiltered[xCol])) == 1 | nrow(unique(dfFiltered[yCol])) == 1 | nrow(unique(dfFiltered[zCol])) == 1) {
      inboundContractCheck <- append(inboundContractCheck, list("columns_unique_length_is_one" = TRUE))
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
      print(toJSON(inboundContractCheck))
      stop("columns unique length is one")
    }
  
    # check if rows greater than 5000 then take first 5000 rows.
    if (nrow(dfFiltered) > 5000) {
      inboundContractCheck <- append(inboundContractCheck, list("warning_limited_rows_taken" = TRUE))
      dfFiltered <- dfFiltered[sample(nrow(dfFiltered),5000),]
    }
    # check if coerce columns successfull or stop execution
    if (length(inboundContractCheck[['error_coerce']]) > 0) {
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
      print(toJSON(inboundContractCheck))
      stop("error coerce columns")
    }
  # log coerce time
  inboundContractCheck <- append(inboundContractCheck, 
                                 list("coerce_time_elapsed" = 
                                        coerceTimeElapsed[['elapsed']]))
  options(warn=-1)
  if (nrow(dfFiltered) > 0) {
    dfFiltered = dfFiltered %>% na.omit()
    outputWarning = FALSE
    outputError = FALSE
    tryCatch({
      if (colorCol == "emptycol" && textCol !="emptycol") {
         result <- try(
           chartGenerateTimeElapsed <- system.time (
             p <- plot_ly(dfFiltered, x = sort(dfFiltered[[xCol]]),
                          y = sort(dfFiltered[[yCol]]), z = dfFiltered[[zCol]],type = "scatter3d",
                          mode = "lines",text = dfFiltered[[textCol]]) %>%
                          config(displaylogo = F, collaborate = F) %>%
                          layout(scene = scene))
         , silent = TRUE)
      } else if (colorCol != "emptycol" && textCol =="emptycol") {
        result <- try(
          chartGenerateTimeElapsed <- system.time (
            p <- plot_ly(dfFiltered, x = sort(dfFiltered[[xCol]]),
                         y = sort(dfFiltered[[yCol]]), z = dfFiltered[[zCol]],type = "scatter3d", mode = "lines",
                         color = dfFiltered[[colorCol]], colors = "Paired") %>%
                         config(displaylogo = F, collaborate = F) %>%
                         layout(scene = scene))
         , silent = TRUE)
      } else if (colorCol == "emptycol" && textCol =="emptycol") {
        result <- try(
          chartGenerateTimeElapsed <- system.time (
            p <- plot_ly(dfFiltered, x = sort(dfFiltered[[xCol]]),
                         y = sort(dfFiltered[[yCol]]), z = dfFiltered[[zCol]],type = "scatter3d", mode = "lines") %>%
                         config(displaylogo = F, collaborate = F) %>%
                         layout(scene = scene))
        , silent = TRUE)
      } else {
        result <- try(
          chartGenerateTimeElapsed <- system.time (
            p <- plot_ly(dfFiltered, x = sort(dfFiltered[[xCol]]),
            y = sort(dfFiltered[[yCol]]), z = dfFiltered[[zCol]],type = "scatter3d", mode = "lines",
            color = dfFiltered[[colorCol]], colors = "Paired", text = dfFiltered[[textCol]]) %>%
            #layout(xaxis = x, yaxis = y, zaxis = z)
            config(displaylogo = F, collaborate = F) %>%
            layout(scene = scene)
           )
        , silent = TRUE)
      }
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
            htmlwidgets::saveWidget(p, imgPath, selfcontained = FALSE)), silent = TRUE)
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